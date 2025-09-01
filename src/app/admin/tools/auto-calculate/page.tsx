'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  Calculator, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AutoCalculatePage() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<{
    success: boolean;
    processed: number;
    updated: number;
    skipped: number;
    errors: number;
    details: string[];
  } | null>(null);

  const handleAutoCalculate = async () => {
    setIsCalculating(true);
    setCalculationResult(null);
    
    try {
      // Get all data
      const [competitorsSnapshot, hourlyEntriesSnapshot, bigCatchesSnapshot] = await Promise.all([
        getDocs(collection(db, 'competitors')),
        getDocs(collection(db, 'hourly_entries')),
        getDocs(collection(db, 'big_catches'))
      ]);
      
      const competitors = competitorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const hourlyEntries = hourlyEntriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const bigCatches = bigCatchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let processed = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;
      const details: string[] = [];
      
      // Calculate for each competitor
      for (const competitor of competitors) {
        processed++;
        
        try {
          // Calculate nbPrisesGlobal and poidsTotalGlobal
          let nbPrisesGlobal = 0;
          let poidsTotalGlobal = 0;
          
          for (let hour = 1; hour <= 7; hour++) {
            const entry = hourlyEntries.find(e => 
              e.competitorId === competitor.id && 
              e.hour === hour &&
              ['locked_judge', 'locked_admin', 'offline_judge', 'offline_admin'].includes(e.status)
            );
            
            if (entry) {
              nbPrisesGlobal += entry.fishCount || 0;
              poidsTotalGlobal += entry.totalWeight || 0;
            }
          }
          
          // Get grosse prise
          const bigCatchEntry = bigCatches.find(e => 
            e.competitorId === competitor.id &&
            ['locked_judge', 'locked_admin', 'offline_judge', 'offline_admin'].includes(e.status)
          );
          const grossePrise = bigCatchEntry ? (bigCatchEntry.grossePrise || bigCatchEntry.biggestCatch || 0) : 0;
          
          // Calculate points
          const points = (nbPrisesGlobal * 50) + poidsTotalGlobal;
          
          // Calculate coefficientSecteur
          // Get all competitors in the same sector to calculate sector total
          const sectorCompetitors = competitors.filter(c => c.sector === competitor.sector);
          let sectorTotalNbPrises = 0;
          
          // Calculate sector total
          for (const sectorComp of sectorCompetitors) {
            let compNbPrises = 0;
            for (let hour = 1; hour <= 7; hour++) {
              const entry = hourlyEntries.find(e => 
                e.competitorId === sectorComp.id && 
                e.hour === hour &&
                ['locked_judge', 'locked_admin', 'offline_judge', 'offline_admin'].includes(e.status)
              );
              
              if (entry) {
                compNbPrises += entry.fishCount || 0;
              }
            }
            sectorTotalNbPrises += compNbPrises;
          }
          
          // Calculate coefficient: (Points × Nb Prises global) / Total Nb Prises global Secteur
          let coefficientSecteur = 0;
          if (sectorTotalNbPrises > 0) {
            coefficientSecteur = (points * nbPrisesGlobal) / sectorTotalNbPrises;
          }
          
          // Check if update is needed
          const needsUpdate = 
            competitor.nbPrisesGlobal !== nbPrisesGlobal ||
            competitor.poidsTotalGlobal !== poidsTotalGlobal ||
            competitor.grossePrise !== grossePrise ||
            competitor.points !== points ||
            competitor.coefficientSecteur !== coefficientSecteur;
          
          if (needsUpdate) {
            // Update competitor document
            await updateDoc(doc(db, 'competitors', competitor.id), {
              nbPrisesGlobal,
              poidsTotalGlobal,
              grossePrise,
              points,
              coefficientSecteur
            });
            
            updated++;
            details.push(`✅ Mis à jour: ${competitor.fullName} (${nbPrisesGlobal} prises, ${poidsTotalGlobal}g, ${points} pts, coeff: ${coefficientSecteur.toFixed(3)})`);
          } else {
            skipped++;
            details.push(`⏭️ Déjà à jour: ${competitor.fullName}`);
          }
        } catch (error: any) {
          errors++;
          details.push(`❌ Erreur ${competitor.fullName}: ${error.message}`);
          console.error(`Error calculating for ${competitor.id}:`, error);
        }
      }
      
      setCalculationResult({
        success: errors === 0,
        processed,
        updated,
        skipped,
        errors,
        details
      });
      
    } catch (error: any) {
      console.error('Auto-calculation error:', error);
      setCalculationResult({
        success: false,
        processed: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        details: [`❌ Erreur générale: ${error.message}`]
      });
    }
    
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Auto-Calcul des Champs
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Outil pour recalculer automatiquement tous les champs calculés
        </p>
        
        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                🧮 Recalcul automatique disponible
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Cet outil va recalculer tous les champs calculés pour tous les compétiteurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Auto-Calculate Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-ocean-600" />
              <span>Recalcul Automatique des Champs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Que fait ce recalcul ?
              </h4>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Recalcule `nbPrisesGlobal` (somme H1-H7)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Recalcule `poidsTotalGlobal` (somme H1-H7)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Met à jour `grossePrise` depuis big_catches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Recalcule `points` = (nbPrises × 50) + poidsTotal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Recalcule `coefficientSecteur` = (Points × nbPrises) / Total secteur</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Avant de commencer
              </h4>
              <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <div>• Assurez-vous que les données hourly_entries et big_catches sont correctes</div>
                <div>• Cette opération met à jour tous les documents competitors</div>
                <div>• Les calculs sont basés sur les données actuelles de Firebase</div>
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={handleAutoCalculate}
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              {isCalculating ? 'Recalcul en cours...' : 'Démarrer le Recalcul Automatique'}
            </Button>
            
            {calculationResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  calculationResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    calculationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {calculationResult.success ? '✅ Recalcul terminé avec succès' : '❌ Recalcul terminé avec erreurs'}
                  </h4>
                  <div className={`text-sm space-y-1 ${
                    calculationResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    <div>📊 Compétiteurs traités: {calculationResult.processed}</div>
                    <div>✅ Mis à jour: {calculationResult.updated}</div>
                    <div>⏭️ Déjà à jour: {calculationResult.skipped}</div>
                    {calculationResult.errors > 0 && (
                      <div>❌ Erreurs: {calculationResult.errors}</div>
                    )}
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Détails du recalcul:
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {calculationResult.details.map((detail, index) => (
                      <div key={index}>{detail}</div>
                    ))}
                  </div>
                </div>
                
                {calculationResult.success && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      🎉 Recalcul réussi !
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tous les champs calculés sont maintenant synchronisés avec les données actuelles.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
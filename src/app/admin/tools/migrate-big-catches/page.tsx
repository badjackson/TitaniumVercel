'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  Database, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw,
  Shield,
  ArrowRight
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MigrateBigCatchesPage() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    processed: number;
    migrated: number;
    skipped: number;
    errors: number;
    details: string[];
  } | null>(null);

  const handleMigrateBigCatches = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      const bigCatchesSnapshot = await getDocs(collection(db, 'big_catches'));
      const docs = bigCatchesSnapshot.docs;
      
      let processed = 0;
      let migrated = 0;
      let skipped = 0;
      let errors = 0;
      const details: string[] = [];
      
      for (const docSnapshot of docs) {
        processed++;
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        try {
          // Check if document has old field name
          if (data.hasOwnProperty('biggestCatch')) {
            const biggestCatchValue = data.biggestCatch || 0;
            
            // Update document: add new field and remove old field
            await updateDoc(doc(db, 'big_catches', docId), {
              grossePrise: biggestCatchValue,
              biggestCatch: deleteField()
            });
            
            migrated++;
            details.push(`✅ Migré: ${docId} (${data.biggestCatch || 0}g → grossePrise)`);
          } else if (data.hasOwnProperty('grossePrise')) {
            skipped++;
            details.push(`⏭️ Déjà migré: ${docId}`);
          } else {
            // Document doesn't have either field, add grossePrise with 0
            await updateDoc(doc(db, 'big_catches', docId), {
              grossePrise: 0
            });
            
            migrated++;
            details.push(`✅ Ajouté grossePrise: ${docId} (0g)`);
          }
        } catch (error: any) {
          errors++;
          details.push(`❌ Erreur ${docId}: ${error.message}`);
          console.error(`Error migrating document ${docId}:`, error);
        }
      }
      
      setMigrationResult({
        success: errors === 0,
        processed,
        migrated,
        skipped,
        errors,
        details
      });
      
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        processed: 0,
        migrated: 0,
        skipped: 0,
        errors: 1,
        details: [`❌ Erreur générale: ${error.message}`]
      });
    }
    
    setIsMigrating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Migration Big Catches Firebase
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Outil pour migrer le champ `biggestCatch` vers `grossePrise`
        </p>
        
        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                🔄 Migration automatique disponible
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Cet outil va automatiquement renommer tous les champs `biggestCatch` en `grossePrise` dans Firebase.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Migration Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-ocean-600" />
              <span>Migration: biggestCatch → grossePrise</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Que fait cette migration ?
              </h4>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Renomme le champ `biggestCatch` en `grossePrise`</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Conserve toutes les valeurs existantes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Supprime l'ancien champ après migration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Ajoute `grossePrise: 0` si le champ n'existe pas</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Avant de commencer
              </h4>
              <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <div>• Assurez-vous d'avoir une sauvegarde de Firebase</div>
                <div>• Cette opération modifie tous les documents big_catches</div>
                <div>• La migration est irréversible</div>
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={handleMigrateBigCatches}
              disabled={isMigrating}
              className="w-full"
            >
              {isMigrating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isMigrating ? 'Migration en cours...' : 'Démarrer la Migration Big Catches'}
            </Button>
            
            {migrationResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  migrationResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    migrationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {migrationResult.success ? '✅ Migration terminée avec succès' : '❌ Migration terminée avec erreurs'}
                  </h4>
                  <div className={`text-sm space-y-1 ${
                    migrationResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    <div>📊 Documents traités: {migrationResult.processed}</div>
                    <div>✅ Migrés: {migrationResult.migrated}</div>
                    <div>⏭️ Déjà migrés: {migrationResult.skipped}</div>
                    {migrationResult.errors > 0 && (
                      <div>❌ Erreurs: {migrationResult.errors}</div>
                    )}
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Détails de la migration:
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {migrationResult.details.map((detail, index) => (
                      <div key={index}>{detail}</div>
                    ))}
                  </div>
                </div>
                
                {migrationResult.success && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      🎉 Migration réussie !
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tous les documents utilisent maintenant le champ `grossePrise`. 
                      L'application est maintenant cohérente avec la spécification.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>État actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Champ actuel:</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  biggestCatch
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Champ cible:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  grossePrise
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Collection:</span>
                <Badge variant="outline">
                  big_catches
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  1. Vérifier les données
                </h4>
                <p className="text-blue-700 dark:text-blue-300">
                  Assurez-vous que tous les big_catches ont des données cohérentes dans Firebase.
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  2. Lancer la migration
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Cliquez sur "Démarrer la Migration" pour renommer automatiquement tous les champs.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                  3. Vérifier le résultat
                </h4>
                <p className="text-green-700 dark:text-green-300">
                  Consultez le rapport de migration et vérifiez dans la console Firebase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
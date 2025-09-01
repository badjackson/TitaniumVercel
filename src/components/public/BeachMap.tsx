'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/components/providers/TranslationProvider';
import { useFirestore } from '@/components/providers/FirestoreSyncProvider';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import CompetitorAvatar from '@/components/ui/CompetitorAvatar';
import { motion } from 'framer-motion';

interface CompetitorChip {
  id: string;
  name: string;
  equipe: string;
  boxNumber: number;
  boxCode: string;
  sector: string;
  points: number;
  fishCount: number;
  totalWeight: number;
  biggestCatch: number;
  photo: string;
}

export default function BeachMap() {
  const t = useTranslations('beachMap');
  const { 
    competitors: firestoreCompetitors, 
    hourlyEntries: firestoreHourlyEntries, 
    bigCatches: firestoreBigCatches 
  } = useFirestore();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorChip | null>(null);
  const [competitors, setCompetitors] = useState<{ [sector: string]: CompetitorChip[] }>({});

  // Calculate competitors data from Firebase
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const calculateCompetitorsFromFirebase = () => {
      const competitorsBySector: { [sector: string]: CompetitorChip[] } = {};
      
      // Group Firebase competitors by sector
      firestoreCompetitors.forEach(comp => {
        if (!competitorsBySector[comp.sector]) {
          competitorsBySector[comp.sector] = [];
        }
        
        // Calculate real stats from Firebase data
        let totalFishCount = 0;
        let totalWeight = 0;
        let biggestCatch = 0;
        
        // Sum across all 7 hours from Firebase hourly entries
        for (let hour = 1; hour <= 7; hour++) {
          const entry = firestoreHourlyEntries.find(e => 
            e.competitorId === comp.id && 
            e.hour === hour &&
            ['locked_judge', 'locked_admin', 'offline_judge', 'offline_admin'].includes(e.status)
          );
          
          if (entry) {
            totalFishCount += entry.fishCount || 0;
            totalWeight += entry.totalWeight || 0;
          }
        }
        
        // Get grosse prise from Firebase
        const grossePriseEntry = firestoreBigCatches.find(e => 
          e.competitorId === comp.id &&
          ['locked_judge', 'locked_admin', 'offline_judge', 'offline_admin'].includes(e.status)
        );
        
        if (grossePriseEntry) {
          biggestCatch = grossePriseEntry.grossePrise || 0;
        }
        
        // Calculate points: (Nb Prises global × 50) + Poids Total global
        const points = (totalFishCount * 50) + totalWeight;
        
        competitorsBySector[comp.sector].push({
          id: comp.id,
          name: comp.fullName,
          equipe: comp.equipe,
          boxNumber: comp.boxNumber,
          boxCode: comp.boxCode,
          sector: comp.sector,
          points,
          fishCount: totalFishCount,
          totalWeight,
          biggestCatch,
          photo: comp.photo
        });
      });
      
      // Sort competitors by box number within each sector
      Object.keys(competitorsBySector).forEach(sector => {
        competitorsBySector[sector].sort((a, b) => a.boxNumber - b.boxNumber);
      });
      
      return competitorsBySector;
    };
    
    setCompetitors(calculateCompetitorsFromFirebase());
  }, [firestoreCompetitors, firestoreHourlyEntries, firestoreBigCatches]);

  const sectors = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Sector button colors
  const getSectorButtonClass = (sector: string, isSelected: boolean) => {
    const baseClass = 'px-4 py-2 rounded-full transition-all font-medium';
    const sectorColors = {
      A: isSelected ? 'bg-sectors-A text-white shadow-lg' : 'bg-sectors-A/20 text-sectors-A hover:bg-sectors-A/30',
      B: isSelected ? 'bg-sectors-B text-white shadow-lg' : 'bg-sectors-B/20 text-sectors-B hover:bg-sectors-B/30',
      C: isSelected ? 'bg-sectors-C text-white shadow-lg' : 'bg-sectors-C/20 text-sectors-C hover:bg-sectors-C/30',
      D: isSelected ? 'bg-sectors-D text-white shadow-lg' : 'bg-sectors-D/20 text-sectors-D hover:bg-sectors-D/30',
      E: isSelected ? 'bg-sectors-E text-white shadow-lg' : 'bg-sectors-E/20 text-sectors-E hover:bg-sectors-E/30',
      F: isSelected ? 'bg-sectors-F text-white shadow-lg' : 'bg-sectors-F/20 text-sectors-F hover:bg-sectors-F/30',
    };
    
    return `${baseClass} ${sectorColors[sector as keyof typeof sectorColors] || 'bg-gray-100 text-gray-600'}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-sand-50 to-coral-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('interactiveBeachMap')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('beachMapDescription')}
          </p>
        </div>

        <Card className="max-w-7xl mx-auto">
          <CardContent>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => setSelectedSector('all')}
                className={`px-4 py-2 rounded-full transition-all font-medium ${
                  selectedSector === 'all'
                    ? 'bg-ocean-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('allSectors')}
              </button>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={getSectorButtonClass(sector, selectedSector === sector)}
                >
                  {t('sector')} {sector}
                </button>
              ))}
            </div>

            {selectedSector !== 'all' && sectors.includes(selectedSector) && (
              <div className="relative">
                <div className="space-y-3">
                  {/* First row - competitors 1-10 */}
                  <div className="grid grid-cols-10 gap-3">
                    {competitors[selectedSector]?.slice(0, 10).map((competitor, index) => (
                      <motion.div
                        key={competitor.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedCompetitor(competitor)}
                      >
                        <div className="relative">
                          <CompetitorAvatar
                            photo={competitor.photo}
                            name={competitor.name}
                            sector={competitor.sector}
                            size="xl"
                            className="ring-2 ring-white shadow-lg hover:scale-110 transition-transform"
                          />
                          <Badge 
                            className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center text-xs"
                            variant="secondary"
                          >
                            {String(competitor.boxNumber).padStart(2, '0')}
                          </Badge>
                        </div>
                        
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                            <div className="font-semibold">{competitor.name}</div>
                            <div className="text-gray-300">{competitor.equipe}</div>
                            <div className="flex justify-between gap-4 mt-1">
                              <span className="text-gray-200">{competitor.points} pts</span>
                              <span className="text-gray-200">{competitor.fishCount} fish</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Second row - competitors 11-20 */}
                  <div className="grid grid-cols-10 gap-3">
                    {competitors[selectedSector]?.slice(10, 20).map((competitor, index) => (
                      <motion.div
                        key={competitor.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: (index + 10) * 0.05 }}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedCompetitor(competitor)}
                      >
                        <div className="relative">
                          <CompetitorAvatar
                            photo={competitor.photo}
                            name={competitor.name}
                            sector={competitor.sector}
                            size="xl"
                            className="ring-2 ring-white shadow-lg hover:scale-110 transition-transform"
                          />
                          <Badge 
                            className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center text-xs"
                            variant="secondary"
                          >
                            {String(competitor.boxNumber).padStart(2, '0')}
                          </Badge>
                        </div>
                        
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                            <div className="font-semibold">{competitor.name}</div>
                            <div className="text-gray-300">{competitor.equipe}</div>
                            <div className="flex justify-between gap-4 mt-1">
                              <span className="text-gray-200">{competitor.points} pts</span>
                              <span className="text-gray-200">{competitor.fishCount} fish</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedSector === 'all' && (
              <div className="space-y-6">
                {sectors.map(sector => (
                  <div key={sector} className="space-y-3">
                    <h3 className={`text-lg font-semibold text-center sector-${sector.toLowerCase()}`}>
                      {t('sector')} {sector}
                    </h3>
                    <div className="space-y-3">
                      {/* First row - competitors 1-10 */}
                      <div className="grid grid-cols-10 gap-3">
                        {competitors[sector]?.slice(0, 10).map((competitor, index) => (
                          <motion.div
                            key={competitor.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedCompetitor(competitor)}
                          >
                            <div className="relative">
                              <CompetitorAvatar
                                photo={competitor.photo}
                                name={competitor.name}
                                sector={competitor.sector}
                                size="xl"
                                className="ring-2 ring-white shadow-lg hover:scale-110 transition-transform"
                              />
                              <Badge 
                                className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center text-xs"
                                variant="secondary"
                              >
                                {String(competitor.boxNumber).padStart(2, '0')}
                              </Badge>
                            </div>
                            
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                                <div className="font-semibold">{competitor.name}</div>
                                <div className="text-gray-300">{competitor.equipe}</div>
                                <div className="flex justify-between gap-4 mt-1">
                                  <span className="text-gray-200">{competitor.points} pts</span>
                                  <span className="text-gray-200">{competitor.fishCount} fish</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Second row - competitors 11-20 */}
                      <div className="grid grid-cols-10 gap-3">
                        {competitors[sector]?.slice(10, 20).map((competitor, index) => (
                          <motion.div
                            key={competitor.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: (index + 10) * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedCompetitor(competitor)}
                          >
                            <div className="relative">
                              <CompetitorAvatar
                                photo={competitor.photo}
                                name={competitor.name}
                                sector={competitor.sector}
                                size="xl"
                                className="ring-2 ring-white shadow-lg hover:scale-110 transition-transform"
                              />
                              <Badge 
                                className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center text-xs"
                                variant="secondary"
                              >
                                {String(competitor.boxNumber).padStart(2, '0')}
                              </Badge>
                            </div>
                            
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                                <div className="font-semibold">{competitor.name}</div>
                                <div className="text-gray-300">{competitor.equipe}</div>
                                <div className="flex justify-between gap-4 mt-1">
                                  <span className="text-gray-200">{competitor.points} pts</span>
                                  <span className="text-gray-200">{competitor.fishCount} fish</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitor Modal/Popup */}
        {selectedCompetitor && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCompetitor(null)}
          >
            <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CompetitorAvatar
                    photo={selectedCompetitor.photo}
                    name={selectedCompetitor.name}
                    sector={selectedCompetitor.sector}
                    size="lg"
                  />
                  <div>
                    <div className="font-semibold">{selectedCompetitor.name}</div>
                    <div className="text-sm text-gray-500">{selectedCompetitor.equipe}</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedCompetitor.points}</div>
                      <div className="text-sm text-gray-500">{t('points')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedCompetitor.fishCount}</div>
                      <div className="text-sm text-gray-500">{t('fishCaught')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedCompetitor.totalWeight}g</div>
                      <div className="text-sm text-gray-500">{t('totalWeight')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedCompetitor.biggestCatch}g</div>
                      <div className="text-sm text-gray-500">{t('biggestCatch')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
import React, { useMemo } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useUI, LayoutModes } from '../../context/UIContext';
import MoodFilterBar from '../ui/MoodFilterBar';
import CommandPalette from '../ui/CommandPalette';
import FloatingActionDock from '../ui/FloatingActionDock';
import BadgeAwardOverlay from '../ui/BadgeAwardOverlay';
import ReadingProgressBar from '../ui/ReadingProgressBar';
import ParallaxAccentCanvas from '../ui/ParallaxAccentCanvas';
import DynamicReadingCanvas from './layouts/DynamicReadingCanvas';
import RibbonStream from './layouts/RibbonStream';
import MagazineSpread from './layouts/MagazineSpread';
import SpatialTiles from './layouts/SpatialTiles';
import StackedNewspaper from './layouts/StackedNewspaper';

function SummaryExperience({ summaries, loading }) {
  const { layoutMode, layoutTokens, badge } = useUI();

  const layoutComponent = useMemo(() => {
    switch (layoutMode) {
      case LayoutModes.RIBBON_STREAM:
        return RibbonStream;
      case LayoutModes.MAGAZINE_SPREAD:
        return MagazineSpread;
      case LayoutModes.SPATIAL_TILES:
        return SpatialTiles;
      case LayoutModes.STACKED_NEWSPAPER:
        return StackedNewspaper;
      case LayoutModes.DYNAMIC_CANVAS:
      default:
        return DynamicReadingCanvas;
    }
  }, [layoutMode]);

  const LayoutView = layoutComponent;

  return (
    <div className="summary-experience">
      <ReadingProgressBar />
      <ParallaxAccentCanvas />
      <MoodFilterBar />
      <LayoutGroup>
        <AnimatePresence mode="wait">
          <LayoutView key={layoutMode} summaries={summaries} loading={loading} />
        </AnimatePresence>
      </LayoutGroup>
      <FloatingActionDock />
      <CommandPalette />
      <AnimatePresence>
        {badge && <BadgeAwardOverlay key={badge.id || badge.name} badge={badge} />}
      </AnimatePresence>
    </div>
  );
}

export default SummaryExperience;

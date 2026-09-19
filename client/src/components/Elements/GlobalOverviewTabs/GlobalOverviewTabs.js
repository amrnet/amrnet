// Global Overview top-of-dashboard panel.
//
// Renders the <Map /> directly. The previous dev-only "Bar plot" tab
// (StratifiedResistanceGraph) was hidden per product decision — only the Map is
// shown, in both development and production. The bar-plot component is kept in
// the repo (StratifiedResistanceGraph) for future reuse; it is simply no longer
// surfaced here. Restore the tabbed layout from git history if it's wanted again.

import { Map } from '../Map';

export const GlobalOverviewTabs = () => {
  return <Map />;
};

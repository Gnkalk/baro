import { useState } from "react";
import { useNavigation } from "./navigationContext";
import { useGlobalKeys } from "../hooks/useGlobalKeys";
import { HomeScreen } from "../screens/HomeScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { PackageDetailScreen } from "../screens/PackageDetailScreen";
import { PkgbuildReviewScreen } from "../screens/PkgbuildReviewScreen";
import { OperationLogScreen } from "../screens/OperationLogScreen";
import { UpdateScreen } from "../screens/UpdateScreen";
import { InstalledScreen } from "../screens/InstalledScreen";
import { HelpOverlay } from "../components/Modals/HelpOverlay";

export function AppShell() {
  const { screen } = useNavigation();
  const [helpOpen, setHelpOpen] = useState(false);

  useGlobalKeys({
    onHelp: () => setHelpOpen((v) => !v),
    textInputFocused: false,
  });

  return (
    <box flexGrow={1} flexDirection="column">
      {screen.name === "home" && <HomeScreen />}
      {screen.name === "search" && <SearchScreen />}
      {screen.name === "detail" && <PackageDetailScreen pkg={screen.pkg} />}
      {screen.name === "pkgbuildReview" && <PkgbuildReviewScreen pkgNames={screen.pkgNames} />}
      {screen.name === "operationLog" && <OperationLogScreen op={screen.op} targets={screen.targets} />}
      {screen.name === "update" && <UpdateScreen />}
      {screen.name === "installed" && <InstalledScreen />}
      {helpOpen && <HelpOverlay />}
    </box>
  );
}

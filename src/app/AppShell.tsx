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
import { StatusScreen } from "../screens/StatusScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { HelpOverlay } from "../components/Modals/HelpOverlay";
import { theme } from "../theme";

export function AppShell() {
  const { screen } = useNavigation();
  const [helpOpen, setHelpOpen] = useState(false);

  useGlobalKeys({
    onHelp: () => setHelpOpen((v) => !v),
    textInputFocused: false,
  });

  return (
    <box flexGrow={1} flexDirection="column" backgroundColor={theme.bg.base}>
      {screen.name === "home" && <HomeScreen />}
      {screen.name === "search" && <SearchScreen />}
      {screen.name === "detail" && <PackageDetailScreen pkg={screen.pkg} />}
      {screen.name === "pkgbuildReview" && <PkgbuildReviewScreen pkgNames={screen.pkgNames} />}
      {screen.name === "operationLog" && <OperationLogScreen op={screen.op} targets={screen.targets} />}
      {screen.name === "update" && <UpdateScreen />}
      {screen.name === "installed" && <InstalledScreen />}
      {screen.name === "status" && <StatusScreen />}
      {screen.name === "about" && <AboutScreen />}
      {helpOpen && <HelpOverlay />}
    </box>
  );
}

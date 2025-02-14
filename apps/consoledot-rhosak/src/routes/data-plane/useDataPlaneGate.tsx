import { useKafka } from "consoledot-api";
import { useRouteMatch } from "react-router-dom";
import type { DataPlaneRouteParams } from "./routesConsts";
import { DataPlaneRoutePath } from "./routesConsts";

export function useDataPlaneGate() {
  const match = useRouteMatch<DataPlaneRouteParams>(DataPlaneRoutePath);
  if (!match) {
    throw Error("useDataPlaneGate used outside the expected route");
  }
  const { data: instance } = useKafka(match.params.id, true);
  return { instance: instance as NonNullable<typeof instance>, match };
}

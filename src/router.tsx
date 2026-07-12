import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

type PlannerRoutesProps = {
  home: ReactNode;
  plannerList: ReactNode;
  plannerDetail: ReactNode;
  stats: ReactNode;
  trash: ReactNode;
};

export function PlannerRoutes({
  home,
  plannerList,
  plannerDetail,
  stats,
  trash,
}: PlannerRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={home} />
      <Route path="/planners" element={plannerList} />
      <Route path="/planners/:plannerId" element={plannerDetail} />
      <Route path="/stats" element={stats} />
      <Route path="/trash" element={trash} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

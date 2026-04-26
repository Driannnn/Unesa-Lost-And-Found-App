import { Outlet } from "react-router";
import { StoreProvider } from "../store/StoreContext";

export function Root() {
  return (
    <StoreProvider>
      <div className="h-screen w-full max-w-md mx-auto bg-background overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </StoreProvider>
  );
}

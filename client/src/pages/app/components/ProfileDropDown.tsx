import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/axios";
import { setAccessToken } from "@/reducers/fullAppReducer";
import { useFullApp } from "@/store/hooks/useFullApp";
import { User2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

function ProfileDropDown() {
  const dispatch = useDispatch();
  const logout = async () => {
    await authApi.post("/logout");
    localStorage.removeItem("refreshToken");
    dispatch(setAccessToken(null));
    window.location.reload();
  };
  const { user } = useFullApp();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 dark:bg-gray-950  dark:text-white"
        align="start"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link className="cursor-pointer" to={"/profile"}>
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropDown;

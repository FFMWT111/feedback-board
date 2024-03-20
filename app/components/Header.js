"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "../button/Button";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;
  function logout() {
    signOut();
    localStorage.clear();
  }

  function login() {
    signIn("google");
  }

  return (
    <div className="flex items-center justify-end gap-4 max-w-2xl mx-auto pt-4 shadow-sm">
      {isLoggedIn && (
        <>
          <span className="font-semibold text-slate-600">
            Hello,{session?.user?.name}!
          </span>
          <Button primary={"true"} onClick={logout}>
            <ArrowLeftCircleIcon className="w-4 h-4 text-white" />
            Logout
          </Button>
        </>
      )}
      {!isLoggedIn && (
        <>
          <span>Not logged in</span>
          <Button primary="true" onClick={login}>
            <ArrowRightCircleIcon className="w-4 h-4 text-white" />
            Login
          </Button>
        </>
      )}
    </div>
  );
}

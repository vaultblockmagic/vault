"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { CheckIcon } from "@heroicons/react/24/outline";


export const AuthSelection = ({
    authOption,
    handleAuthOptionClick,
    checkCustomPwd,
  }: any) => {
    const [customPwd, setCustomPwd] = useState("");
    const [customPwdConfirm, setCustomPwdConfirm] = useState("");
    const handlePwdChange = (e: any, confirm: boolean) => {
      confirm
        ? setCustomPwdConfirm(e.target.value)
        : setCustomPwd(e.target.value);
    };

    const confirm = (authOptionName: string, customPwd: string, customPwdConfirm: string) => {
      checkCustomPwd(authOptionName, customPwd, customPwdConfirm)
    }

    return (
      <>
        <div
          className={`flex items-center ${
            !authOption.checked
              ? "bg-neutral-800 border-slate-600"
              : authOption.custom
              ? authOption.confirm
                ? "bg-emerald-800 border-emerald-400"
                : "bg-yellow-700 border-yellow-500"
              : "bg-emerald-800 border-emerald-400"
          } border-2 rounded-lg px-4 py-2 my-1 cursor-pointer w-2/3`}
          onClick={() => handleAuthOptionClick(authOption.name)}
        >
          {" "}
          <div className="pr-1">{authOption.icon}</div>
          <span className="flex-1 text-center">{authOption.name}</span>
          <div
            className={`w-5 h-5 flex items-center text-xs justify-center border border-slate-600 rounded transition-all duration-300 ${
              !authOption.checked
                ? "bg-neutral-800"
                : authOption.custom
                ? authOption.confirm
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-yellow-500 border-yellow-500"
                : "bg-emerald-500 border-emerald-500"
            }`}
            /*
              if authoption not checked:
                bg-neutral-800
              else:
                if authoption.custom:
                  if authoption.confirm:
                    bg-emerald-500 border-emerald-500
                  else:
                    bg-yellow-500 border-yellow-500
                else:
                  bg-emerald-500 border-emerald-500
            */
          >
            {authOption.checked && <CheckIcon className="text-white" />}
          </div>
        </div>
        {authOption.checked && authOption.custom && !authOption.confirm && (
          <div className="w-2/3 items-center justify-center">
            <Input
              type="password"
              value={customPwd}
              onChange={(e) => handlePwdChange(e, false)}
              className="border-2 border-sky-700 rounded-md px-4 py-2 w-full mt-2 focus-visible:ring-0 focus-visible:border-sky-500 my-1.5 py-4 bg-neutral-800"
              placeholder="Password..."
            />
            <Input
              type="password"
              value={customPwdConfirm}
              onChange={(e) => handlePwdChange(e, true)}
              className="border-2 border-sky-700 rounded-md px-4 py-2 w-full mt-2 focus-visible:ring-0 focus-visible:border-sky-500 my-1.5 py-4 bg-neutral-800"
              placeholder="Confirm password..."
            />
            <div className="flex w-full px-16 py-2 items-center justify-center">
              <Button
                type="button"
                // className="inline-flex w-full justify-center rounded-md bg-neutral-100 px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:ring-gray-600 dark:hover:bg-neutral-900 sm:mt-0 sm:w-auto"
                className="w-full"
                onClick={() => confirm(authOption.name, customPwd, customPwdConfirm)}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };
import React, { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronUp } from "lucide-react";

import {
    Cloud,
    CreditCard,
    Github,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    Settings,
    User,
    UserPlus,
    Users,
  } from "lucide-react"

function Chat() {

    return (

        <div className="flex flex-col h-full w-full bg-white rounded-lg border border-slate-400 overflow-clip">

            <div className="flex flex-row items-center px-4 py-2 h-[8%] bg-slate-200/70 border-solid border-b border-slate-400">

                <div className="h-2 w-2 bg-green-500 rounded mr-3"/>
                <h2 className="text-sm pr-2">Room Name</h2>

                <DropdownMenu className="relative">
                    <DropdownMenuTrigger asChild className="aspect-square h-full ml-auto border border-solid border-slate-400">
                        <Button className="p-0" variant="outline"><Users size={14} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="absolute -right-4 w-fit border border-solid border-slate-400">
                        <DropdownMenuLabel>Players</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-300" />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Player</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>

            <div className="flex flex-row items-center py-3 px-3 gap-3 h-[10%] w-full mt-auto bg-slate-200 border-solid border-t border-slate-400">

                <Input className="h-full w-full bg-white rounded-full border border-slate-400 pl-[7%]" placeholder="Send a message..."/>

                <Button className="flex aspect-square h-full rounded-full bg-white items-center justify-center border border-slate-400 p-0 text-slate-900 hover:bg-slate-50 active:bg-slate-200">

                    <ChevronUp size={18} />

                </Button>

            </div>

        </div>

    );

}

export default Chat;
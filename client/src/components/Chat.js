import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronUp } from "lucide-react";

function Chat({disabled}) {

    return (

        <div className="h-full w-full relative">

            {disabled && (
            
                <div className="absolute inset-0 bg-slate-900/60 rounded-lg"/>

            )}

            <Card className="flex-none flex-col w-full h-full bg-slate-200 border-slate-400 overflow-clip">
                <div className="h-full">
                    <CardContent className="px-8 pb-10 pt-6 h-full">
                        
                        <div className="h-full w-full pb-8">
        
                            <h1 className="text-sm font-medium mb-4">Chat</h1>

                            <div className="flex flex-col h-full w-full bg-white rounded-lg border border-slate-400 overflow-clip">

                                <div className="flex flex-row items-center py-2 px-3 gap-3 h-[10%] w-full mt-auto bg-slate-300 border-solid border-t border-slate-400">

                                    <Input className="h-full w-full bg-slate-50 rounded-full border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 pl-[7%]" placeholder="Send a message...">
                                    
                                    </Input>

                                    <Button className="flex aspect-square h-full rounded-full bg-slate-50 items-center justify-center border border-slate-400 p-0 text-slate-900 hover:bg-slate-100 active:bg-slate-200">

                                        <ChevronUp size={18} />

                                    </Button>

                                </div>

                            </div>

                        </div>

                    </CardContent>
                </div>
            </Card>

        </div>

    );

}

export default Chat;
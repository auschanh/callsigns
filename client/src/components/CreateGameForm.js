"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Switch } from "./ui/switch";

import { useSocketContext } from "../contexts/SocketContext";

// Form Validation
const formSchema = z.object({

	username: z.string().min(1, {

		message: "Please enter a username.", 

	}),

	roomName: z.string().min(1, {

		message: "Please select a room name."

	}),

	numPlayers: z.number().gt(0, {

		message: "Enter number of players."

	}),

	aiPlayers: z.number().gte(0, {

		message: "Enter number of AI players."

	})

});

export default function CreateGameForm({ gameInfoState, nextSlide, roomCreated }) {

	const [socket, setSocket] = useSocketContext();

	const [gameInfo, setGameInfo] = gameInfoState;

	const [changedRoomName, setChangedRoomName] = useState(false);

	const [playerCount, setPlayerCount] = useState();

	const [isAiPlayers, setIsAiPlayers] = useState(false);

	const [isRoomCreated, setIsRoomCreated] = roomCreated;

	// 1. Define your form.
	const form = useForm({

		// Use Form Validation
		resolver: zodResolver(formSchema),

		//	// Use Default Values
		// 	defaultValues: {
		// 		username: "",
		// },
	});

	// const form = useForm();
	// const { register, watch } = useForm();

	// 2. Define a submit handler.
	function onSubmit(values) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.

		console.log(values);

		setGameInfo(values);

		try {

			socket.emit("gameInfo", values, isRoomCreated);

		} catch (error) {

			throw error;

		}		

		setIsRoomCreated(true);

		nextSlide();

	}

	useEffect(() => {

		if (gameInfo) {

			if (!form.getValues("username")) {

				form.setValue("username", gameInfo.username);
	
			}
	
			if (!form.getValues("roomName"))	{
	
				form.setValue("roomName", gameInfo.roomName);
	
			}
	
			if (!form.getValues("numPlayers") || (form.getValues("numPlayers") !== gameInfo.numPlayers)) {
	
				form.setValue("numPlayers", gameInfo.numPlayers);
	
			}
	
			if (!form.getValues("aiPlayers") || (form.getValues("aiPlayers") !== gameInfo.aiPlayers)) {
	
				form.setValue("aiPlayers", gameInfo.aiPlayers);
	
			}
	
			if (playerCount === undefined) {
	
				if (gameInfo.aiPlayers !== 0) {

					setIsAiPlayers(value => !value);

				}
	
			}

			setPlayerCount(gameInfo.numPlayers);

		}

	}, [gameInfo, form]);

	function handleInputChange(event) {

		const { name, value } = event.target;

		// Update both input fields based on the changed input
		form.setValue(name, value);

		if (name === "roomName") {

			setChangedRoomName(true);

		} else if (name === "username") {

			if (!changedRoomName) {

				form.setValue("roomName", `${value}'s Room`); // Set the value of input2 to match input1

			}

		}

	}

	const handlePlayerCount = (players) => {

		form.setValue("numPlayers", players);

		setPlayerCount(players);

		form.setValue("aiPlayers", 0);

		if (players < 3) {

			setIsAiPlayers(true);

			form.setValue("aiPlayers", 3 - players);

		}

	}

	return (

		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full pb-10">
				<FormField
					defaultValue={''}
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem className="mb-4">
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder={"Enter Username"}
									{...field}
									onChange={handleInputChange}
									id="userName"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					defaultValue={''}
					control={form.control}
					name="roomName"
					render={({ field }) => (
						<FormItem className="mb-4">
							<FormLabel>Room Name</FormLabel>
							<FormControl>
								<Input 
									placeholder={"Enter Room Name"} 
									{...field} 
									onChange={handleInputChange}
									id="roomName"
									onFocus={(event) => event.target.select()}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					defaultValue={0}
					control={form.control}
					name="numPlayers"
					render={({ field }) => (
						<FormItem className="mb-6">
							<FormLabel>Number of Players</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="flex flex-row gap-4"
								>
									{Array.from({ length: 7 }, (_, index) => {
										return (
											<FormItem
												key={index + 1}
												className="flex items-center"
											>
												<FormLabel
													className={`
														cursor-pointer h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
														border border-slate-200 bg-white text-slate-500 hover:bg-slate-900/80 hover:text-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
														duration-300
														${field.value === index + 1
															? "border bg-slate-900 text-slate-50 outline ring-offset-white ring-2 ring-slate-950 ring-offset-2"
															: ""
														}
													`}
												>
													<FormControl>
														<RadioGroupItem
															value={index + 1}
															className="invisble h-0 w-0 border-none"
															onClick={() => {handlePlayerCount(index + 1)}}
														/>
													</FormControl>
													{index + 1}
												</FormLabel>
											</FormItem>
										);
									})}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					defaultValue={0}
					control={form.control}
					name="aiPlayers"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex flex-row justify-between items-center mb-4">
								<div>AI Players</div>
								<Switch 
										className="data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-slate-400"
										checked={isAiPlayers}
										onCheckedChange={() => {

											if (playerCount < 3) {

												return;

											}
											
											setIsAiPlayers(!isAiPlayers); 
											
											if (isAiPlayers) {

												form.setValue("aiPlayers", 0);

											}								
											
										}}
								/>
							</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="flex flex-row gap-4"
								>

									{isAiPlayers && 

										Array.from({ length: 6 }, (_, index) => {

											if (index + 1 <= (7 - playerCount)) {

												if (index + 1 === 1 && playerCount === 1) {

													return (

														<FormItem
															key={index + 1}
															className="flex items-center"
														>
															<FormLabel
																className={`
																	h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
																	border border-slate-200 bg-slate-500/50 text-slate-50/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
																`}
															>
																<FormControl>
																	<RadioGroupItem
																		value={index + 1}
																		className="invisble h-0 w-0 border-none"
																		disabled
																	/>
																</FormControl>
																{index + 1}
															</FormLabel>
														</FormItem>

													);

												} else {

													return (

														<FormItem
															key={index + 1}
															className="flex items-center"
														>
															<FormLabel
																className={`
																	cursor-pointer h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
																	border border-slate-200 bg-white text-slate-500 hover:bg-slate-900/80 hover:text-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
																	duration-300
																	${field.value === index + 1
																		? "border bg-slate-900 text-slate-50 outline ring-offset-white ring-2 ring-slate-950 ring-offset-2"
																		: ""
																	}
																`}
															>
																<FormControl>
																	<RadioGroupItem
																		value={index + 1}
																		className="invisble h-0 w-0 border-none"
																		onClick={() => {
																			
																			if (form.getValues("aiPlayers") === 0 
																					|| (playerCount === 1 && form.getValues("aiPlayers") === 2) 
																					|| (playerCount === 2 && form.getValues("aiPlayers") === 1)
																			) {
	
																				form.setValue("aiPlayers", index + 1);

																			}
																		}}
																	/>
																</FormControl>
																{index + 1}
															</FormLabel>
														</FormItem>
		
													);

												}

											} else {

												return (

													<FormItem
														key={index + 1}
														className="flex items-center"
													>
														<FormLabel
															className={`
																h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
																border border-slate-200 bg-slate-500/50 text-slate-50/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
															`}
														>
															<FormControl>
																<RadioGroupItem
																	value={index + 1}
																	className="invisble h-0 w-0 border-none"
																	disabled
																/>
															</FormControl>
															{index + 1}
														</FormLabel>
													</FormItem>
	
												);

											}
										})
									}
									
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button className="flex w-48 self-center mt-auto" type="submit">Submit</Button>

			</form>
		</Form>
	);
}

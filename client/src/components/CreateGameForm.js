"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Switch } from "./ui/switch";

import { useSocketContext } from "../contexts/SocketContext";

function CreateGameForm({ gameInfoState, nextSlide, roomCreated, inLobby }) {

	const [socket, setSocket] = useSocketContext();

	const [gameInfo, setGameInfo] = gameInfoState;

	const [changedRoomName, setChangedRoomName] = useState(false);

	const [playerCount, setPlayerCount] = useState();

	const [isAiPlayers, setIsAiPlayers] = useState(false);

	const [isRoomCreated, setIsRoomCreated] = roomCreated;

	const [isUsernameValid, setIsUsernameValid] = useState(false);

	const [isRoomNameValid, setIsRoomNameValid] = useState(false);

	const [isNumPlayersValid, setIsNumPlayersValid] = useState(false);

	// Form Validation
	const formSchema = z.object({

		username: z.string()
			.min(1, { message: "Please enter a username." })
			.min(3, { message: "Username must be at least 3 characters long." })
			.refine((value) => !/\s/.test(value), { message: "Username cannot contain spaces." })
			.refine((value) => /(.*[a-z]){1}/i.test(value), { message: "Username must contain at least one letter." })
			.refine((value) => (!gameInfo || gameInfo.username === value) || !inLobby?.some((player) => { return player.playerName === value }), { message: "This username has already been taken." })
			,

		roomName: z.string()
			.min(1, { message: "Please select a room name." })
			.refine((value) => /^[^\s]/.test(value), { message: "Room name cannot start with a space." })
			,

		numPlayers: z.number().gt(0, {

			message: "Enter number of players."

		}),

		aiPlayers: z.number().gte(0, {

			message: "Enter number of AI players."

		}),

		numGuesses: z.number().array().optional(),

		numRounds: z.number().array().optional(),

		timeLimit: z.number().array().optional(),

		keepScore: z.boolean().optional(),

	});

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

		const formattedValues = {

			...values, 
			numGuesses: values.numGuesses? values.numGuesses[0] + 1 : 1,
			numRounds: values.numRounds? values.numRounds[0] + 1 : 11,
			timeLimit: values.timeLimit? values.timeLimit[0] : 0,
			keepScore: values.keepScore !== undefined ? values.keepScore : true,

		}

		

		setGameInfo(formattedValues);

		try {

			socket.emit("gameInfo", formattedValues, isRoomCreated);

		} catch (error) {

			throw error;

		}		

		setIsRoomCreated(true);

		nextSlide();

	}

	useEffect(() => {

		if ((!isUsernameValid || !isRoomNameValid || !isNumPlayersValid) && (gameInfo && (gameInfo.username && gameInfo.roomName && gameInfo.numPlayers))) {

			

			setIsUsernameValid(true);

			setIsRoomNameValid(true);

			setIsNumPlayersValid(true);
			
		}

	}, [gameInfo]);

	useEffect(() => {

		if (gameInfo) {

			if (!form.getValues("username")) {

				form.setValue("username", gameInfo.username);
	
			}
	
			if (!form.getValues("roomName")) {
	
				form.setValue("roomName", gameInfo.roomName);
	
			}
	
			if (!form.getValues("numPlayers") || (form.getValues("numPlayers") !== gameInfo.numPlayers)) {
	
				form.setValue("numPlayers", gameInfo.numPlayers);
	
			}
	
			if (!form.getValues("aiPlayers") || (form.getValues("aiPlayers") !== gameInfo.aiPlayers)) {
	
				form.setValue("aiPlayers", gameInfo.aiPlayers);
	
			}

			if (!form.getValues("numGuesses")) {

				form.setValue("numGuesses", [gameInfo.numGuesses - 1]);

			}

			if (!form.getValues("numRounds")) {

				form.setValue("numRounds", [gameInfo.numRounds - 1]);

			}

			if (!form.getValues("timeLimit")) {

				form.setValue("timeLimit", [gameInfo.timeLimit]);

			}

			if (!form.getValues("keepScore")) {

				form.setValue("keepScore", gameInfo.keepScore);

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

		if (value && (!isUsernameValid || !isRoomNameValid)) {

			

			if (name === "username") {

				

				setIsUsernameValid(true);

				if (form.getValues("roomName")) {

					

					setIsRoomNameValid(true);

				}

			} else if (name === "roomName") {

				setIsRoomNameValid(true);

			}

		} else if (!value) {

			if (name === "username") {

				setIsUsernameValid(false);

			} else if (name === "roomName") {

				setIsRoomNameValid(false);

			}

		}

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

		if (!isNumPlayersValid) {

			setIsNumPlayersValid(true);

		}

		form.setValue("numPlayers", players);

		setPlayerCount(players);

		form.setValue("aiPlayers", 0);

		if (players < 3) {

			setIsAiPlayers(true);

			form.setValue("aiPlayers", 3 - players);

		}

	}

	return (

		<div className="flex flex-col flex-none h-full">

			<Tabs defaultValue="roomSettings" className="mb-12 h-full">

				<TabsList className="w-full px-2 py-2 bg-slate-50 mb-2 gap-2">
					<TabsTrigger value="roomSettings" className="w-full text-xs">Room Settings</TabsTrigger>
					<TabsTrigger value="additionalSettings" className="w-full text-xs">Additional Settings</TabsTrigger>
				</TabsList>

				<Form {...form} className="h-full">

					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">

						<TabsContent value="roomSettings" className="h-full">

							<FormField
								defaultValue={''}
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem className="mb-4">
										<FormLabel>Username *</FormLabel>
										<FormControl>
											<Input
												autoFocus
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
										<FormLabel>Room Name *</FormLabel>
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
										<FormLabel>Number of Players *</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex flex-row gap-4"
											>
												{/* {Array.from({ length: 7 }, (_, index) => {
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
												})} */}

												{Array.from({ length: 5 }, (_, index) => {
													return (
														<FormItem
															key={index + 3}
															className="flex items-center"
														>
															<FormLabel
																className={`
																	cursor-pointer h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
																	border border-slate-200 bg-white text-slate-500 hover:bg-slate-900/80 hover:text-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
																	duration-300
																	${field.value === index + 3
																		? "border bg-slate-900 text-slate-50 outline ring-offset-white ring-2 ring-slate-950 ring-offset-2"
																		: ""
																	}
																`}
															>
																<FormControl>
																	<RadioGroupItem
																		value={index + 3}
																		className="invisble h-0 w-0 border-none"
																		onClick={() => {handlePlayerCount(index + 3)}}
																	/>
																</FormControl>
																{index + 3}
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

							{/* <FormField
								defaultValue={0}
								control={form.control}
								name="aiPlayers"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row justify-between items-center">
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
							/> */}

						</TabsContent>

						<TabsContent value="additionalSettings" className="h-full pt-2">

							<FormField
								defaultValue={[0]}
								control={form.control}
								name="numGuesses"
								render={({ field }) => (

									<FormItem className="space-y-4 cursor-pointer mb-8">

										<div className="flex flex-row justify-between">
											<FormLabel>Number of Guesses:</FormLabel>
											<p className="text-sm leading-none">{Number(field.value) + 1 !== 11 ? Number(field.value) + 1 : "Unlimited"}</p>
										</div>

										<FormControl>
											<Slider
												max={10}
												step={1}
												onValueChange={field.onChange}
												value={field.value ? field.value : [0]}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								defaultValue={[10]}
								control={form.control}
								name="numRounds"
								render={({ field }) => (

									<FormItem className="space-y-4 cursor-pointer mb-8">

										<div className="flex flex-row justify-between">
											<FormLabel>Number of Rounds:</FormLabel>
											<p className="text-sm leading-none">{Number(field.value) + 1 !== 11 ? Number(field.value) + 1 : "Unlimited"}</p>
										</div>

										<FormControl>
											<Slider
												max={10}
												step={1}
												onValueChange={field.onChange}
												value={field.value ? field.value : [10]}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								defaultValue={[0]}
								control={form.control}
								name="timeLimit"
								render={({ field }) => (

									<FormItem className="space-y-4 cursor-pointer mb-8">

										<div className="flex flex-row justify-between">
											<FormLabel>Timer:</FormLabel>
											<p className="text-sm leading-none">
												{Number(field.value) !== 0 ? ((Math.floor(Number(field.value) / 60)) === 0 ? "" : ((Math.floor(Number(field.value) / 60)) + "m ")) + ((Number(field.value) % 60) + "s") : "Off"}
											</p>
										</div>

										<FormControl>
											<Slider
												max={120}
												step={15}
												onValueChange={field.onChange}
												value={field.value ? field.value : [0]}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								defaultValue={true}
								control={form.control}
								name="keepScore"
								render={({ field }) => (

									<FormItem className="space-y-0 cursor-pointer mt-10 mb-6 flex flex-none flex-row justify-between items-center">

										<FormLabel>Keep Score:</FormLabel>

										<FormControl>
											
											<Switch
												className="data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-slate-400"
												checked={field.value}
												onCheckedChange={field.onChange}	
											/>

										</FormControl>

										<FormMessage />

									</FormItem>
								)}
							/>

						</TabsContent>

						<Button 
							className="flex w-48 self-center mt-auto mb-10" 
							type="submit"
							disabled={!(isUsernameValid && isRoomNameValid && isNumPlayersValid)}
						>
							Submit
						</Button>

					</form>

				</Form>
				
			</Tabs>

		</div>

	);

}

export default CreateGameForm;

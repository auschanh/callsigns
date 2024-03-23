"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

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

export default function CreateGameForm({ setGameInfo }) {

	const [socket, setSocket] = useSocketContext();

	const [changedRoomName, setChangedRoomName] = useState(false);

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

		socket.emit("gameInfo", values);

	}

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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					defaultValue={''}
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem className="mb-8">
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									autoFocus
									placeholder={"Enter Username"}
									{...field}
									onChange={handleInputChange}
									id="userName"
								/>
							</FormControl>
							{/* <FormDescription>Description 1</FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					defaultValue={''}
					control={form.control}
					name="roomName"
					render={({ field }) => (
						<FormItem className="mb-8">
							<FormLabel>Room Name</FormLabel>
							<FormControl>
								<Input 
									placeholder={"Enter Room Name"} 
									{...field} 
									onChange={handleInputChange}
									id="roomName" 
								/>
							</FormControl>
							{/* <FormDescription>Description2</FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					defaultValue={0}
					control={form.control}
					name="numPlayers"
					render={({ field }) => (
						<FormItem className="mb-8">
							<FormLabel>Number of Players</FormLabel>

							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="flex flex-row gap-6"
								>
									{Array.from({ length: 7 }).map((_, index) => {
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
															className="invisble focus:outline h-0 w-0 border-none"
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
					control={form.control}
					name="aiPlayers"
					render={({ field }) => (
						<FormItem>
							<FormLabel>AI Players</FormLabel>

							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="flex flex-row gap-6"
								>
									{Array.from({ length: 7 }).map((_, index) => {
										return (
											<FormItem
												key={index}
												className="flex items-center"
											>
												<FormLabel
													className={`
														cursor-pointer h-10 px-3 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
														border border-slate-200 bg-white text-slate-500 hover:bg-slate-900/80 hover:text-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50
														duration-300
														${field.value === index
															? "border bg-slate-900 text-slate-50 outline ring-offset-white ring-2 ring-slate-950 ring-offset-2"
															: ""
														}
                          							`}
												>
													<FormControl>
														<RadioGroupItem
															value={index}
															className="invisble focus:outline h-0 w-0 border-none"
														/>
													</FormControl>
													{index}
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

				<Button className="mt-12" type="submit">Submit</Button>
			</form>
		</Form>
	);
}

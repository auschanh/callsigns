"use client";

// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { z } from "zod";

import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

// Form Validation
// const formSchema = z.object({
// 	username: z.string().min(2, {
// 		message: "Username must be at least 2 characters.",
// 	}),
// });

export default function CreateGameForm({ setGameInfo }) {

	// 1. Define your form.
	// const form = useForm({

	//	// Use Form Validation
	// 	resolver: zodResolver(formSchema),

	//	// Use Default Values
	// 	defaultValues: {
	// 		username: "",
	// 	},
	// });

	const form = useForm();

	// 2. Define a submit handler.
	function onSubmit(values) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		
		console.log(values);

		setGameInfo(values);

	}

	return (

		<Form {...form}>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (

						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder={'Placeholder1'} {...field} />
							</FormControl>
							<FormDescription>Description1</FormDescription>
							<FormMessage />
						</FormItem>

					)}

				/>

				<FormField
					control={form.control}
					name="roomName"
					render={({ field }) => (

						<FormItem>
							<FormLabel>Room Name</FormLabel>
							<FormControl>
								<Input placeholder={'Placeholder2'} {...field} />
							</FormControl>
							<FormDescription>Description2</FormDescription>
							<FormMessage />
						</FormItem>
					
					)}

				/>

				<FormField
				
					control={form.control}
					name="numPlayers"
					render={({ field }) => (

						<FormItem>

							<FormLabel>Number of Players</FormLabel>

							<FormControl>

								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className="flex flex-row space-y-1"
								>

									{
										
										Array.from({ length: 7 }).map((_, index) => {

											return (

												<FormItem key={index + 1} className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value={index + 1} />
													</FormControl>
													<FormLabel className="font-normal">
														{index + 1}
													</FormLabel>
												</FormItem>

											);

										})
							
									}

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
									className="flex flex-row space-y-1"
								>

									{
										
										Array.from({ length: 6 }).map((_, index) => {

											return (

												<FormItem key={index + 1} className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value={index + 1} />
													</FormControl>
													<FormLabel className="font-normal">
														{index + 1}
													</FormLabel>
												</FormItem>

											);

										})
							
									}

								</RadioGroup>

							</FormControl>
							<FormMessage />
						</FormItem>
					
					)}

				/>

				<Button type="submit">Submit</Button>

			</form>

		</Form>

	);
}

/*  @type {import('tailwindcss').Config} */

module.exports = {

	mode: 'jit',

	purge: [

		"./src/*.{html,js}",
		"./src/**/*.{html,js}", 
		"./public/*.{html,js}"
		
	  ],

	content: [

		"./src/*.{html,js}",
		"./src/**/*.{html,js}", 
		"./public/*.{html,js}"
	
	],

	theme: {

		extend: {},

	},

	plugins: [],

}


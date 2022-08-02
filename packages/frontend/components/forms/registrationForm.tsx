import { useRouter } from "next/router"

import React, { useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { FormProvider, useForm } from "react-hook-form"
import { AiOutlineLoading } from "react-icons/ai"

import { $api } from "@/utils/axios"
import { yupResolver } from "@hookform/resolvers/yup"

import { FormInput } from "./formInput"
import { PasswordErrorHelper } from "./passwordErrorHelper"
import { schemaRegistration } from "./schema"
import { EPasswordErrorTexts, HookRegistrationFormValues } from "./types"

const passwordErrorsText = [
	EPasswordErrorTexts.Low,
	EPasswordErrorTexts.Up,
	EPasswordErrorTexts.Number,
	EPasswordErrorTexts.Min
]

let captcha

export const RegistrationForm: React.FC = () => {
	const methods = useForm<HookRegistrationFormValues>({
		resolver: yupResolver(schemaRegistration),
		criteriaMode: "all",
		mode: "all"
	})
	const router = useRouter()
	const {
		handleSubmit,
		setValue,
		setError,
		formState: { isSubmitting, errors }
	} = methods

	const [isPasswordTyped, setIsPasswordTyped] = useState(false)
	const onSubmit = async (data) => {
		try {
			await $api("auth/signup", {
				method: "POST",
				data: {
					...data
				}
			})
			router.push("/")
		} catch (error) {
			const errors = error.response.data.errors
			for (const key in errors) {
				setError(key, { message: errors[key].message })
			}
			captcha.reset()
			setValue("captcha", "")
		}
	}
	const handleCaptcha = (value) => {
		setValue("captcha", value)
	}

	return (
		<FormProvider {...methods}>
			<form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
				<FormInput name="email" type="text" />
				<FormInput name="username" type="text" />
				<FormInput setIsPasswordTyped={setIsPasswordTyped} name="password" type="password" />

				<div className="mt-2">
					{passwordErrorsText.map((item) => (
						<PasswordErrorHelper key={item} isPasswordTyped={isPasswordTyped} text={item} />
					))}
				</div>
				<FormInput name="passwordConfirm" type="password" />
				<div className="mt-3 relative">
					<ReCAPTCHA
						sitekey={process.env.NX_CAPTCHA_SITE}
						onChange={handleCaptcha}
						className="scale-75 sm:scale-100"
						ref={(el) => {
							captcha = el
						}}
					/>
					<p className="-mt-[2px] ml-3 text-xs text-red-500">{errors?.captcha?.message}</p>
				</div>

				<button
					type="submit"
					className="px-[10px] py-[5px] bg-[#0079d3] text-white rounded mt-3 hover:bg-[#2279bc] transition-colors text-center"
					disabled={isSubmitting}
				>
					<p className="flex justify-center">
						{isSubmitting ? <AiOutlineLoading className="animate-spin" /> : "SIGN UP"}
					</p>
				</button>
			</form>
		</FormProvider>
	)
}
//SIGN UP

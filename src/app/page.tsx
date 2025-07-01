"use client";

import axios from "axios";
import { useForm } from "react-hook-form";

export default function Home() {
  const formMethods = useForm<{ link: string; clientId: string }>();

  const onSubmit = formMethods.handleSubmit(async values => {
    await axios.get("api/resume/pdf", { params: { link: values.link, clientId: values.clientId } });
  });

  return (
    <form className="flex flex-col items-stretch font-[family-name:var(--font-geist-sans)] w-md" onSubmit={onSubmit}>
      <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Link
      </label>

      <input
        type="text"
        id="link"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="https://docs.google.com/example"
        required
        {...formMethods.register("link")}
      />

      <label htmlFor="client-id" className="mt-4 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        ClientId
      </label>

      <input
        type="text"
        id="client-id"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="JohnDoe"
        required
        {...formMethods.register("clientId")}
      />

      <button className="cursor-pointer w-full mt-6 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
        {formMethods.formState.isSubmitting ? "loading..." : "Convert"}
      </button>
    </form>
  );
}

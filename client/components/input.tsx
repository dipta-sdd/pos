'use client'

import { Input as HeroInput } from "@heroui/input";

export default function Input({
  classNames,
  ...props
}: {
  classNames?: any;
  [key: string]: any;
}) {
    const {inputWrapper, ...rest} = classNames || {};
  return <HeroInput
  
  classNames={{
    ...rest,
    inputWrapper: `group-data-[focus=true]:border-blue-500 data-[hover=true]:border-blue-500 focus-within:border-blue-500 ${inputWrapper}`,
    }}
    {...props}
  />;
}
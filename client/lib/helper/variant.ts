export const getFullVariantName = (variant_name: string, value: string) => {
    if (!variant_name && !value) return "";
    const skip = ["standard", "default"];
    //   dont have multiple variant of product , returning empty string
    if (
        skip.includes(variant_name?.toLowerCase()) &&
        skip.includes(value?.toLowerCase())
    ) {
        return "";
    }
    return `${variant_name}: ${value}`;
};
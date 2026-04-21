export const formatDateTime = (dateString: string | null) => {
  console.log(dateString);
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (dateString: string | null) => {
  console.log(dateString);
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

import Categories from "@/constants/Categories";

const findCategoryLabel = (Category: string) => {
	return Categories.find(c => c.value === Category)?.label || Category;
};

export default findCategoryLabel;

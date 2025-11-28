interface PriceHistory extends Record<string, unknown> {
	date_time: Date;
	price: number;
	price_action: string;
	price_action_percent_magnitude: number;
}

interface Item {
	category: string;
	image_link: string;
	last_price: number;
	last_price_action: "increase" | "decrease";
	last_price_action_date_time: Date;
	last_price_action_percent_magnitude: number;
	link: string;
	name: string;
	price_accuracy: string;
	price_history: PriceHistory[];
	product_unique_id: number;
	marketplace: string;
	_id: string;
	url_slug: string;
	is_discount_unavailable: boolean;
	discount_unavailability_cause: string;
	product_description: string;
	rating?: number;
	reviews?: { date: Date; rating: number; content: string }[] | null;
	ai_review?: string;
	isUserNotificationActive: boolean;
	suggestions?: Item[];
	is_user_subscribed?: boolean;
	hide?: boolean;
	is_cheapest?: boolean | null;
	isDiscount?: boolean;
}

interface EditorItem extends Item {
	has_editor_set_category: boolean;
	current_editor_selected_category: string | null;
}

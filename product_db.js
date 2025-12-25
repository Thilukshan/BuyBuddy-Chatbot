export const PRE_ORDER = {
    78124: {
        status: "Out for Delivery",
        expectedDelivery: "Today",
        items: ["Wireless Mouse", "USB-C Cable"],
    },
    78125: {
        status: "Confirmed",
        expectedDelivery: "1–2 days",
        items: ["Noise Cancelling Headphones"],
    },
    78126: {
        status: "Delivered",
        expectedDelivery: "Delivered on 20 Sep",
        items: ["Bluetooth Speaker"],
    },
    78127: {
        status: "Delayed",
        expectedDelivery: "2–3 extra days",
        items: ["Gaming Keyboard"],
    },
};

export const PRODUCT_LIST = [
    {
        name: "Dell Inspiron 15",
        price: 165000,
        brand: "Dell",
        category: "Laptop",
    },
    {
        name: "HP Pavilion 14",
        price: 220000,
        brand: "HP",
        category: "Laptop",
    },
    {
        name: "iPhone 13",
        price: 148000,
        brand: "Apple",
        category: "Phone",
    },
    {
        name: "Samsung Galaxy A54",
        price: 95000,
        brand: "Samsung",
        category: "Phone",
    },
    {
        name: "Boat Rockerz 550",
        price: 36000,
        brand: "Boat",
        category: "Headphones",
    },
    {
        name: "Mi Band 8",
        price: 18000,
        brand: "Xiaomi",
        category: "Smart Band",
    },
];


export const retriveId = (message) => {
    const match = message.match(/#?(\d{4,10})/);
    return match ? match[1] : null;
};

export const ProductRetrival = () => {
    return PRODUCT_LIST;
};

import {getData} from "./constants/db.js";
import './App.css'
import Card from "./components/card/card.jsx"
import Cart from "./components/cart/cart.jsx";
import {useCallback, useEffect, useState} from "react";

const courses = getData()

const telegram = window.Telegram.WebApp
const App = () => {
    const [cartItems, setCartItems] = useState([]);
    useEffect(() => {
        telegram.ready()
    })
    const onAddItem = item => {
        const existItem = cartItems.find(c => c.id === item.id);
        if (existItem){
            const newData = cartItems.map(c => c.id === item.id ? {...existItem, quantity: existItem.quantity + 1} : c);
            setCartItems(newData);
        } else {
            const newData = [...cartItems, { ...item, quantity: 1}];
            setCartItems(newData);
        }
    }
    const onRemoveItem = item => {
        const existItem = cartItems.find(c => c.id === item.id);
        if (existItem.quantity === 1){
            const newData = cartItems.filter(c => c.id !== item.id);
            setCartItems(newData);
        }else {
            const newData = cartItems.map(c => c.id === item.id ? {...existItem, quantity: existItem.quantity - 1} : c);
            setCartItems(newData);
        }
    }

    const onCheckout = () => {
        telegram.MainButton.title= "sotib oling";
        telegram.MainButton.show();
    }

    const onSendData = useCallback(() => {
        const queryID = telegram.initDataUnsave?.query_id;

        if(queryID){
            fetch('http://localhost:8000/web-data', {
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(cartItems)
            });
        } else {
            telegram.sendData(JSON.stringify({products: cartItems, queryID: queryID}));
        }
    }, [cartItems]);

    useEffect(() => {
            telegram.onEvent('mainButtonClicked', onSendData);
            return () => telegram.offEvent('mainButtonClicked', onSendData);
    }, [onSendData]);


    return (
    <>
        <h1 className="heading">Sammi kurslar</h1>
        <Cart cartItems={cartItems} onCheckout={onCheckout}/>
        <div className="cards_container">
            {courses.map(course => (
                <Card key={course.id} course={course} onAddItem={onAddItem} onRemoveItem={onRemoveItem}/>
                ))}
        </div>
    </>
    )
}
export default App

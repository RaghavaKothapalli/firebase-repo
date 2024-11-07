'use client'; // Marks this file as a client-side React component in Next.js

import React, { useState, useEffect, FormEvent } from 'react'; // Import necessary React hooks and types
import {
  collection, // Firebase Firestore functions to interact with the database
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';
import { db } from './firebase'; // Import the Firestore database instance from firebase configuration

// Define TypeScript interfaces for the structure of items and new items
interface Item {
  id?: string; // Optional ID for the item
  name: string; // Item name
  price: number; // Item price
}

interface NewItem {
  name: string; // Name of the new item
  price: string; // Price of the new item as a string (to handle form input)
}

export default function Home() {
  // Declare state variables with their respective types
  const [items, setItems] = useState<Item[]>([]); // State to store the list of items
  const [newItem, setNewItem] = useState<NewItem>({ name: '', price: '' }); // State for the new item input form
  const [total, setTotal] = useState<number>(0); // State for storing the total price of all items

  // Add item to the Firestore database
  const addItem = async (e: FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    if (newItem.name !== '' && newItem.price !== '') { // Check if both fields are filled
      await addDoc(collection(db, 'items'), { // Add new document to the 'items' collection in Firestore
        name: newItem.name.trim(), // Trim leading/trailing spaces from the name
        price: parseFloat(newItem.price), // Convert the price from string to a number
      });
      setNewItem({ name: '', price: '' }); // Reset the input fields after adding the item
    }
  };

  // Fetch items from the Firestore database and listen for real-time updates
  useEffect(() => {
    const q = query(collection(db, 'items')); // Create a query to get items from Firestore
    const unsubscribe = onSnapshot(q, (querySnapshot) => { // Listen for changes to the Firestore collection
      const itemsArr: Item[] = []; // Array to store the fetched items
      querySnapshot.forEach((doc) => { // Loop through each document in the snapshot
        itemsArr.push({ ...doc.data(), id: doc.id } as Item); // Push each item with its id to the array
      });
      setItems(itemsArr); // Update the state with the fetched items

      // Calculate the total price of all items
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce( // Use reduce to sum the prices of all items
          (sum, item) => sum + item.price, // Add the price of each item to the total
          0 // Start with a sum of 0
        );
        setTotal(totalPrice); // Update the total state with the calculated total price
      };
      calculateTotal(); // Call the function to calculate the total
    });

    return () => unsubscribe(); // Cleanup the listener when the component is unmounted
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  // Delete an item from the Firestore database
  const deleteItem = async (id: string | undefined) => {
    if (id) { // Check if the item has an ID
      await deleteDoc(doc(db, 'items', id)); // Delete the document with the given ID from Firestore
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between sm:p-24 p-4'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm '>
        <h1 className='text-4xl p-4 text-center'>Expense Tracker</h1>
        <div className='bg-slate-800 p-4 rounded-lg'>
          {/* Form for adding a new item */}
          <form className='grid grid-cols-6 items-center text-black' onSubmit={addItem}>
            {/* Input for item name */}
            <input
              value={newItem.name} // Bind the input value to the newItem state
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} // Update state when the input changes
              className='col-span-3 p-3 border' // Styling for the input
              type='text'
              placeholder='Enter Item'
            />
            {/* Input for item price */}
            <input
              value={newItem.price} // Bind the input value to the newItem state
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value }) // Update state when the price changes
              }
              className='col-span-2 p-3 border mx-3'
              type='number'
              placeholder='Enter $'
            />
            {/* Submit button to add the new item */}
            <button
              className='text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl'
              type='submit'
            >
              +
            </button>
          </form>
          <ul>
            {/* Map through items and render each item */}
            {items.map((item) => (
              <li
                key={item.id} // Use the item's ID as the key
                className='my-4 text-white w-full flex justify-between bg-slate-950'
              >
                <div className='p-4 text-white w-full flex justify-between'>
                  <span className='capitalize'>{item.name}</span> {/* Capitalize item name */}
                  <span>${item.price}</span> {/* Display item price */}
                </div>
                {/* Button to delete the item */}
                <button
                  onClick={() => deleteItem(item.id)} // Call deleteItem with the item's ID
                  className='ml-8 text-white p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {/* Show total if there are items */}
          {items.length < 1 ? (
            '' // If no items, don't show the total
          ) : (
            <div className='flex justify-between  text-white p-3'>
              <span>Total</span>
              <span>${total}</span> {/* Display the total price */}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

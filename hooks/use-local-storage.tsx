"use client"

// CHANGE: Created a new custom hook for persistent storage
import { useState, useEffect, useCallback } from "react"

// export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
//   // State to store our value
//   // Pass initial state function to useState so logic is only executed once
//   const [storedValue, setStoredValue] = useState<T>(initialValue)

//   // Read from localStorage on initial mount
//   useEffect(() => {
//     if (typeof window === "undefined") {
//       return
//     }

//     try {
//       const item = window.localStorage.getItem(key)
//       if (item) {
//         setStoredValue(JSON.parse(item))
//       }
//     } catch (error) {
//       console.error("Error reading from localStorage:", error)
//     }
//   }, [key])

//   // Return a wrapped version of useState's setter function that
//   // persists the new value to localStorage.
//   const setValue = (value: T | ((val: T) => T)) => {
//     try {
//       // Allow value to be a function so we have same API as useState
//       const valueToStore = value instanceof Function ? value(storedValue) : value

//       // Save state
//       setStoredValue(valueToStore)

//       // Save to localStorage
//       if (typeof window !== "undefined") {
//         window.localStorage.setItem(key, JSON.stringify(valueToStore))
//       }
//     } catch (error) {
//       console.error("Error writing to localStorage:", error)
//     }
//   }

//   return [storedValue, setValue]
// }

// hooks/use-local-storage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        if (typeof window === "undefined") return initialValue;
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return initialValue;
      }
    });
  
    const setValue = useCallback((value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== "undefined") {
          // Ensure we don't double-stringify the value
          if (typeof valueToStore === "string") {
            window.localStorage.setItem(key, valueToStore);
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        }
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    }, [key, storedValue]);
  
    return [storedValue, setValue] as const;
  }

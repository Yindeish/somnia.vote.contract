'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { iUserSlice } from "../types/user";


const initialState: iUserSlice = {
    address: ''
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserState: <K extends keyof iUserSlice>(state: iUserSlice, action: PayloadAction<{ key: K, value: iUserSlice[K] }>) => {
            const { key, value } = action.payload;
            state[key] = value;
        },
    }
})

export const {
    setUserState
} = userSlice.actions;

export default userSlice.reducer;
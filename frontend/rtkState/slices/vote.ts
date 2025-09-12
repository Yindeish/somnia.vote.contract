'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { iVoteSlice } from "../types/vote";


const initialState: iVoteSlice = {
}

const voteSlice = createSlice({
    name: 'vote',
    initialState,
    reducers: {
        setVoteState: <K extends keyof iVoteSlice>(state: iVoteSlice, action: PayloadAction<{ key: K, value: iVoteSlice[K] }>) => {
            const { key, value } = action.payload;
            state[key] = value;
        },
    }
})

export const {
    setVoteState
} = voteSlice.actions;

export default voteSlice.reducer;
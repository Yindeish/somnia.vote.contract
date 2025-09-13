export type tRole = 'admin' | 'candidate' | 'voter';

export interface iUserSlice {
    address: string,
    role: tRole
}
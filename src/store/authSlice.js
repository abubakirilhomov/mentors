import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerPush } from "../utils/registerPush";

const initialState = {
  isAuth: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl)
// Async thunk для логина
export const loginMentor = createAsyncThunk(
  'auth/loginMentor',
  async ({ name, lastName, password }, { rejectWithValue }) => {
    try {
      const payload = lastName?.trim()
        ? { name, lastName: lastName.trim(), password }
        : { name, password };

      const response = await fetch(`${apiUrl}/api/mentors/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Ошибка авторизации');
      }

      // Сохраняем в localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue('Ошибка сети');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuth = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    loadFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.isAuth = true;
          state.user = user;
          state.token = token;
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginMentor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginMentor.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuth = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;

        registerPush(action.payload.user);
      })
      .addCase(loginMentor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, loadFromStorage, clearError } = authSlice.actions;
export default authSlice.reducer;
import React, { useReducer, useContext } from 'react'
import reducer from './reducer'
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  SETUP_USER_BEGIN,
  SETUP_USER_SUCCESS,
  SETUP_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  HANDLE_CHANGE,
  CLEAR_VALUES,
  CREATE_JOB_BEGIN,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  GET_JOBS_BEGIN,
  GET_JOBS_SUCCESS,
  SET_EDIT_JOB,
  DELETE_JOB_BEGIN,
  EDIT_JOB_BEGIN,
  EDIT_JOB_SUCCESS,
  EDIT_JOB_ERROR,
  SHOW_STATS_BEGIN,
  SHOW_STATS_SUCCESS,
} from './actions'
import axios from 'axios'

// set as default from localStorage
const user = localStorage.getItem('user')
const token = localStorage.getItem('token')
const userLocation = localStorage.getItem('location')

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  user: user ? JSON.parse(user) : null,
  token: token,
  userLocation: userLocation || '',
  showSidebar: false,
  isEditing: false,
  editJobId: '',
  position: '',
  company: '',
  jobLocation: userLocation || '',
  jobTypeOptions: ['full-time', 'part-time', 'remote', 'internship'],
  jobType: 'full-time',
  statusOptions: ['interview', 'decline', 'pending'],
  status: 'pending',
  jobs: [],
  totalJobs: 0,
  page: 1,
  numOfPages: 1,
  stats: {},
  monthlyApplications: [],
}

const AppContext = React.createContext()

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // axios config
  const authFetch = axios.create({
    baseURL: '/api/v1',
  })

  // request interceptor
  authFetch.interceptors.request.use(
    (config) => {
      config.headers.common['Authorization'] = `Bearer ${state.token}`
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // response interceptor
  authFetch.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // if authentication is invalid, then log out the user immediately
      if (error.response.status === 401) {
        logoutUser()
      }
      return Promise.reject(error)
    }
  )

  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT })
    clearAlert()
  }

  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT })
    }, 3000)
  }

  const addUserToLocalStroage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    localStorage.setItem('location', location)
  }

  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('location')
  }

  const setupUser = async ({ currentUser, endPoint, alertText }) => {
    dispatch({ type: SETUP_USER_BEGIN })

    try {
      const response = await axios.post(`/api/v1/auth/${endPoint}`, currentUser)
      const { user, token, location } = response.data

      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: {
          user,
          token,
          location,
          alertText,
        },
      })

      addUserToLocalStroage({ user, token, location })
    } catch (error) {
      dispatch({
        type: SETUP_USER_ERROR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER })
    removeUserFromLocalStorage()
  }

  const updateUser = async (currentUser) => {
    dispatch({ type: UPDATE_USER_BEGIN })
    try {
      const { data } = await authFetch.patch('/auth/updateUser', currentUser)

      const { user, token, location } = data

      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { user, token, location },
      })

      addUserToLocalStroage({ user, token, location })
    } catch (error) {
      // NOTE: We don't need to show auth error because a user is logged out automatically
      if (error.response.status !== 401) {
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: { msg: error.response.data.msg },
        })
      }
    }
    clearAlert()
  }

  const handleChange = ({ name, value }) => {
    dispatch({
      type: HANDLE_CHANGE,
      payload: { name, value },
    })
  }

  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES })
  }

  const createJob = async () => {
    dispatch({ type: CREATE_JOB_BEGIN })

    try {
      const { position, company, jobLocation, jobType, status } = state

      await authFetch.post('/jobs', {
        company,
        position,
        jobLocation,
        jobType,
        status,
      })

      dispatch({ type: CREATE_JOB_SUCCESS })

      dispatch({ type: CLEAR_VALUES })
    } catch (error) {
      if (error.response.status === 401) return
      dispatch({
        type: CREATE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  const getJobs = async () => {
    let url = `/jobs`

    dispatch({ type: GET_JOBS_BEGIN })

    try {
      const { data } = await authFetch.get(url)
      const { jobs, totalJobs, numOfPages } = data

      dispatch({
        type: GET_JOBS_SUCCESS,
        payload: {
          jobs,
          totalJobs,
          numOfPages,
        },
      })
    } catch (error) {
      console.log(error.response)
      // TODO: comment out for now just to debug
      // there is less likely that we get 404 (not found) error because we take care of that in the server side
      // when there is no jobs in the database. That is, we display "No jobs to display..." message in the page.
      // Having said that, there might be ain internal server error (500). In that case, we just log out a user right away.
      // logoutUser()
    }
    // there might be a case where an alert from another page is still in effect(3 seconds) when accessing AllJobs
    // So, we just want to clear whatever alert that persists right after sending the get request to the server
    clearAlert()
  }

  const setEditJob = (id) => {
    dispatch({ type: SET_EDIT_JOB, payload: { id } })
  }

  const editJob = async () => {
    dispatch({ type: EDIT_JOB_BEGIN })

    try {
      const { position, company, jobLocation, jobType, status } = state

      await authFetch.patch(`/jobs/${state.editJobId}`, {
        company,
        position,
        jobLocation,
        jobType,
        status,
      })
      dispatch({ type: EDIT_JOB_SUCCESS })
      dispatch({ type: CLEAR_VALUES })
    } catch (error) {
      if (error.response.status === 401) return
      dispatch({
        type: EDIT_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  const deleteJob = async (jobId) => {
    dispatch({ type: DELETE_JOB_BEGIN })

    try {
      await authFetch.delete(`/jobs/${jobId}`)
      getJobs()
    } catch (error) {
      console.log(error.response)
      // Instead of displaying a possible internal server error as an alert, we simply log out a user.
      // TODO: Uncomment the below later
      // logoutUser()
    }
  }

  const showStats = async () => {
    dispatch({ type: SHOW_STATS_BEGIN })

    try {
      const { data } = await authFetch('/jobs/stats')

      dispatch({
        type: SHOW_STATS_SUCCESS,
        payload: {
          stats: data.defaultStats,
          monthlyApplications: data.monthlyApplications,
        },
      })
    } catch (error) {
      console.log(error.response)
      // TODO: Uncomment the below later
      // logoutUser()
    }
    clearAlert()
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        setupUser,
        toggleSidebar,
        logoutUser,
        updateUser,
        handleChange,
        clearValues,
        createJob,
        getJobs,
        setEditJob,
        editJob,
        deleteJob,
        showStats,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => {
  return useContext(AppContext)
}

export { AppProvider, initialState, useAppContext }

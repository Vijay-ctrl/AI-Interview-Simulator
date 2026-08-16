import axios from "axios";

const API = axios.create({
   baseURL: "http://localhost:5000/api",
   headers: {
      "Content-Type": "application/json",
   },
});

export const createInterview = async (data, token) => {
   const response = await API.post(
      "/interview/create",
      data,
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};

export const generateInterviewQuestions = async (
   interviewId,
   token
) => {
   const response = await API.post(
      `/interview/${interviewId}/generate`,
      {},
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};

export const getInterview = async (
   interviewId,
   token
) => {
   const response = await API.get(
      `/interview/${interviewId}`,
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};

export const submitAnswer = async (
   interviewId,
   questionId,
   userAnswer,
   token
) => {
   const response = await API.post(
      `/interview/${interviewId}/questions/${questionId}/answer`,
      {
         userAnswer,
      },
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};

export const completeInterview = async (
   interviewId,
   token
) => {
   const response = await API.post(
      `/interview/${interviewId}/complete`,
      {},
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};

export const getInterviews = async (token) => {
   const response = await API.get(
      "/interview",
      {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   );

   return response.data;
};
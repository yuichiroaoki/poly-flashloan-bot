import axios from "axios";

interface IRequest {
  data: any;
  errorMessage: string;
}

export const sendRequest = async (url: string): Promise<IRequest> => {
  let response = await axios
    .get(url)
    .then((result) => {
      return {
        data: result.data,
        errorMessage: "",
      };
    })
    .catch((error) => {
      if (error.response) {
        return {
          data: null,
          errorMessage:
            error.response.status +
            ": " +
            error.response.statusText +
            " (" +
            error.response.data.error +
            ")",
        };
      } else if (error.request) {
        return {
          data: null,
          errorMessage: "Error: No response was received",
        };
      } else {
        return {
          data: null,
          errorMessage: "Error: " + error.message,
        };
      }
    });

  return response;
};

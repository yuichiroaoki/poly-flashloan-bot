import axios from "axios";

export const sendRequest = async (url: string) => {
  let response: any = await axios
    .get(url)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      return error;
    });

  return response;
};

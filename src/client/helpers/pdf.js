import { AuthService } from '../services';


const postPDF = async ({
  userId,
  data,
  doorsSnippet,
  systemType,
}) => {
  try {
    return await fetch('/api/orders-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${AuthService.getToken()}`,
      },
      body: JSON.stringify({
        userId,
        data,
        doorsSnippet,
        systemType,
      }),
    })
      .then((res) => res.json())
      .then((json) => json)
      .catch((err) => console.error(err));
  } catch (ex) {
    console.error('[postPDF] error:', ex);
    return null;
  }
};

export default postPDF;

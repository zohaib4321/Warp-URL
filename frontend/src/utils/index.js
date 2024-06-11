export const requestHandler = async (api, setLoading, onSuccess, onError) => {
	setLoading && setLoading(true);
	try {
		const response = await api();
		const { data } = response;

    if (data?.success) {
      onSuccess(data)
    }
	} catch (error) {
    onError(error?.response?.data?.message || "Something went wrong")
  } finally {
    setLoading && setLoading(false)
  }
};

export const isBrowser = typeof window !== undefined;

export const classNames = () => {};

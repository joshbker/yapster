export const load = ({ params }) => {
    console.log("PARAMS", params)
    return {
        params: {
            username: params.username
        }
    };
}; 
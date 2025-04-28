export const load = ({ params }) => {
    console.log("PARAMS", params)
    return {
        username: params.username
    };
}; 
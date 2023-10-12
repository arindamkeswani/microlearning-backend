export default (): any => {
    return process.env.LOG_LEVEL.split(',');
};

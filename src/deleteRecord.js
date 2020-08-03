module.exports = (base, ...ids) => {
    base("TODO").destroy([...ids], function (err, deletedRecords) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Deleted", deletedRecords.length, "records");
    });
};

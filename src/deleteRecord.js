module.exports = (base, ...ids) => {
    base("Projects").destroy([...ids], function (err, deletedRecords) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Deleted", deletedRecords.length, "records");
    });
};

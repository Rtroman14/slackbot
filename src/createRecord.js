module.exports = (base, projectName, record) => {
    base(projectName).create(
        [
            {
                fields: record,
            },
        ],
        function (err, records) {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach(function (record) {
                console.log("Created record with ID = ", record.getId());
            });
        }
    );
};

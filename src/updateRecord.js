module.exports = (base, id, record) => {
    base("Projects").update(
        [
            {
                id: id,
                fields: record,
            },
        ],
        function (err, records) {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach(function (record) {
                console.log("Updated", record.get("Name"), "record");
            });
        }
    );
};

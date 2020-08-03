module.exports = async (base) => {
    // If you only want the first page of records, you can
    // use `firstPage` instead of `eachPage`.
    let allTodos = [];

    await base("TODO")
        .select({
            view: "Grid view",
            filterByFormula: `NOT(Status = "Upcoming")`,
        })
        .all()
        .then((records) => {
            records.map((record) => {
                let todo = {};
                todo.todo = record._rawJson.fields.TODO;
                todo.id = record.id;

                allTodos.push(todo);
            });
        })
        .catch((error) => {
            console.log("Error retrieving todos", error);
        });

    return allTodos;
};

const array = [
  { id: 1, title: "nuber one" },
  { id: 2, title: "number two" },
];

const affichageArray = array.map((obj) => {
  return (
    <div key={obj.id}>
      <h1>{obj.title}</h1>
    </div>
  );
});

console.log(affichageArray);

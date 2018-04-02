export default function(done) {
  return (err) => {
    if (err) {
      done.fail(err);
    }
    done();
  };
}

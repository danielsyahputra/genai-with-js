function getAvailableFlights(departure: string, destination: string): string[] {
  console.log("Getting available flights");
  console.log(departure + " ", destination);
  if (departure == "ABC" && destination == "123") {
    return ["UIA 123", "UUIA 123"];
  }
  if (departure == "DEF" && destination == "456") {
    return ["BOLA 123", "BALE 123"];
  }
  return ["TABOLA BALE 123"];
}

function reserveFlight(flightNumber: string): string | "FULLY_BOOKED" {
  console.log(flightNumber);
  if (flightNumber.length >= 6) {
    console.log(`Reserving flights ${flightNumber}`);
    return "123456";
  }
  return "FULLY_BOOKED";
}

export { getAvailableFlights, reserveFlight };

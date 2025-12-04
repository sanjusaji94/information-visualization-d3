const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "600")
    .text("Life Expectancy Over Time");


d3.csv("data/merged_life_expectancy_dataset.csv").then(function (data) {

    data.forEach(d => {
        d.year = +d.year;
        d.life_expectancy = +d.life_expectancy;
    });

    const countries = [...new Set(data.map(d => d.country))].sort();

    const dropdown = d3.select("#country-select");
    dropdown.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const xAxisGroup = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height})`);

    const yAxisGroup = svg.append("g")
        .attr("class", "axis");

    const gridGroup = svg.append("g")
        .attr("class", "grid");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Life Expectancy");

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.life_expectancy));

    function update(country) {

        const filtered = data.filter(d => d.country === country);

        xScale.domain(d3.extent(filtered, d => d.year));
        yScale.domain([
            d3.min(filtered, d => d.life_expectancy) - 2,
            d3.max(filtered, d => d.life_expectancy) + 2
        ]);

        xAxisGroup.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        yAxisGroup.call(d3.axisLeft(yScale));

        gridGroup.call(
            d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat("")
        );

        const path = svg.selectAll(".line").data([filtered]);

        path.enter()
            .append("path")
            .attr("class", "line")
            .merge(path)
            .attr("d", line);

        path.exit().remove();
    }

    update(countries[0]);

    dropdown.on("change", function () {
        update(this.value);
    });

});

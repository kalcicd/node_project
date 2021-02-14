QGIS Server Configurations.

qgis.demo.conf contains the configuration for the qgis server to be hosted on apache.

node.qgs contains the project file, with qgis settings configured
ORLegislatureLower folder contains shapefiles for the Oregon Legislature.



Docker folder contains a Dockerfile, which installs qgis server and nginx, as well as setting up some other things
Also contains bash scripts to run various docker commands.

The docker container is currently not working, however, the Apache2 configuration works.


Given an x and y coordinate relative to the map (will have to be converted from latitude and longitude)
Will return XML containing all of the features(geographic regions) that the point intersects.
XML will be in the following form:

<GetFeatureInfoResponse>
	<Layer name="ORLegLow">
		<Feature id="0">
			<Attribute value="41" name="STATEFP"/>
			<Attribute value="057" name="STDLST"/>
			<Attribute value="41057" name="GEOID"/>
			<Attribute value="State House District 57" name="NAMELSAD"/>
			<Attribute value="LL" name="LSAD"/>
			<Attribute value="2018" name="LSY"/>
			<Attribute value="G5220" name="MTFCC"/>
			<Attribute value="N" name="FUNCSTAT"/>
			<Attribute value="14251673088" name="ALAND"/>
			<Attribute value="160368937" name="AWATER"/>
			<Attribute value="+45.4184459" name="INTPTLAT"/>
			<Attribute value="-120.0315984" name="INTPTLON"/>
		</Feature>
	</Layer>
</GetFeatureInfoResponse>


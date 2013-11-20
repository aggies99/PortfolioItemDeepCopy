Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        MyApp = this;
        
        MyApp.globalContext = this.getContext().getDataContext();
        
        MyApp.epicList = [];
        MyApp.defaultEpic = MyApp.selectedEpic = "No Filter";
        MyApp.epicList.push( MyApp.selectedEpic );
        MyApp.mmfList = [];
        MyApp.defaultMMF = MyApp.selectedMMF = "All MMFs";
        MyApp.mmfList.push( MyApp.selectedMMF );
        MyApp.featureList = [];
        MyApp.defaultFeature = MyApp.selectedFeature = "None";
        MyApp.featureList.push( MyApp.selectedFeature );
        

        // Load the program list and create the program combobox
        MyApp._loadPortfolioEpics();
    },
    
    _wrapComponent: function(component, cls) {
        var wrapper = Ext.create('Ext.container.Container', {
            componentCls: cls
        });
        
        wrapper.add(component);
        
        return wrapper;
    },
    
    _loadPortfolioEpics: function() {
        Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,
            limit: Infinity,
                
            model: 'PortfolioItem/Epic',
            
            context: MyApp.globalContext,
            
            fetch: ['Name','FormattedID'],
                
            sorters: {
                property: 'Rank',
                direction: 'ASC'
            },
            
            listeners: {
                load: function( myStore, records ) {
                    var index=0;
                    for (index=0; index<records.length; index++) {
                        MyApp.epicList.push( records[index].data.FormattedID + ": " + records[index].data.Name );
                    }
                    MyApp._drawEpicComboBox();
                }
            }
        });
    },
    
    _drawEpicComboBox: function() {
        MyApp.epicCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Epic Items',

            store: MyApp.epicList,
            width: 700,

            listeners: {
                'change': function(combo, newVal) {
                    MyApp.selectedEpic = newVal.split(":")[0];

                    MyApp._loadPortfolioMMFs();
                }
            }
        });

        MyApp.programPane = Ext.create('Ext.container.Container', {
            componentCls: 'inner'
        });

        MyApp.add(MyApp._wrapComponent(MyApp.programPane, 'epicList'));
        
        MyApp.programPane.add(MyApp.epicCombo);
        
        //MyApp._loadPortfolioMMFs();
        
        MyApp.epicCombo.setValue(MyApp.epicList[0]);
    },

    _loadPortfolioMMFs: function() {
        MyApp.mmfList.length = 1;

        // Update the filter
        var myEpicFilter = [];
        
        if ( MyApp.selectedEpic != MyApp.defaultEpic ) {
            myEpicFilter = Ext.create('Rally.data.QueryFilter', {
                property: 'Parent.FormattedID',
                operator: "=",
                value: MyApp.selectedEpic
            });
        }

        Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,
            limit: Infinity,
                
            model: 'PortfolioItem/MMF',
            
            context: MyApp.globalContext,
            
            fetch: ['Name','FormattedID', 'Parent'],
            
            filters: myEpicFilter,
                
            sorters: {
                property: 'Rank',
                direction: 'ASC'
            },
            
            listeners: {
                load: function( myStore, records ) {
                    console.log( records );
                    var index=0;
                    for (index=0; index<records.length; index++) {
                        MyApp.mmfList.push( records[index].data.FormattedID + ": " + records[index].data.Name );
                    }
                    MyApp._drawMMFComboBox();
                }
            }
        });
    },
    
    _drawMMFComboBox: function() {
        
        if( MyApp.mmfCombo !== undefined) {
            MyApp.programPane.remove(MyApp.mmfCombo);
        }
        MyApp.mmfCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'MMF Items',

            store: MyApp.mmfList,
            width: 700,

            listeners: {
                'change': function(combo, newVal) {
                    MyApp.selectedMMF = newVal.split(":")[0];
                    
                    MyApp._loadPortfolioFeatures();
                }
            }
        });

        MyApp.programPane.add(MyApp.mmfCombo);

        //MyApp._loadPortfolioFeatures();
        MyApp.mmfCombo.setValue(MyApp.mmfList[0]);
    },

    _loadPortfolioFeatures: function() {
        MyApp.featureList.length = 1;

        // Update the filter
        var myFeatureFilter = [];
        
        if ( MyApp.selectedMMF != MyApp.defaultMMF ) {
            myFeatureFilter = Ext.create('Rally.data.QueryFilter', {
                property: 'Parent.FormattedID',
                operator: "=",
                value: MyApp.selectedMMF
            });
        }

        Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,
            limit: Infinity,
                
            model: 'PortfolioItem/Feature',
            
            context: MyApp.globalContext,
            
            fetch: ['Name','FormattedID', 'Parent'],
            
            filters: myFeatureFilter,
                
            sorters: {
                property: 'Rank',
                direction: 'ASC'
            },
            
            listeners: {
                load: function( myStore, records ) {
                    var index=0;
                    for (index=0; index<records.length; index++) {
                        MyApp.featureList.push( records[index].data.FormattedID + ": " + records[index].data.Name );
                    }
                    MyApp._drawFeatureComboBox();
                }
            }
        });
    },
    
    _drawFeatureComboBox: function() {
        
        if( MyApp.featureCombo !== undefined) {
            MyApp.programPane.remove(MyApp.featureCombo);
        }
        MyApp.featureCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Feature Items',

            store: MyApp.featureList,
            width: 700,

            listeners: {
                'change': function(combo, newVal) {
                    MyApp.selectedFeature = newVal.split(":")[0];
                    
                    MyApp._drawCopyButton();
                }
            }
        });

        MyApp.programPane.add(MyApp.featureCombo);

        MyApp.featureCombo.setValue(MyApp.featureList[0]);
        
        MyApp._drawCopyButton();
    },
    
    _determineWhatToCopy: function() {
        MyApp.CopyId = "Nothing";
        
        if(MyApp.selectedFeature != MyApp.defaultFeature)
        {
            MyApp.CopyId = MyApp.selectedFeature;
        }
        else if(MyApp.selectedMMF != MyApp.defaultMMF)
        {
            MyApp.CopyId = MyApp.selectedMMF;   
        }
        else if(MyApp.selectedEpic != MyApp.defaultEpic)
        {
            MyApp.CopyId = MyApp.selectedEpic;
        } 
        
        return MyApp.CopyId;
    },
    
    _drawCopyButton: function() {
        if( MyApp.copyButton !== undefined) {
            MyApp.programPane.remove(MyApp.copyButton);
        }
        
        MyApp.copyButton = Ext.create('Ext.Container', {
            items: [{
                xtype: 'rallybutton',
                text: 'Copy ' + MyApp._determineWhatToCopy(),
                handler: MyApp._copyButtonHandler
            }]
        });
        MyApp.programPane.add(MyApp.copyButton);
    },
    
    _copyButtonHandler: function() {
        var modelType = "PortfolioItem";
        if ( MyApp.CopyId[0] === 'E' ) {
            modelType += "/Epic";
        }
        else if ( MyApp.CopyId[0] === 'M' ) {
            modelType += "/MMF";
        }
        else if ( MyApp.CopyId[0] === 'F' ) {
            modelType += "/Feature";
        }

        Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,

            model: modelType,
            
            context: MyApp.globalContext,
            
            filters: [
                {
                    property: 'FormattedID',
                    operator: '=',
                    value: MyApp.CopyId
                }
            ],
            
            listeners: {
                load: function( myStore, records ) {
                    console.log( records );
                    MyApp._startCopy();
                }
            }
        });
        
    },
    
    _startCopy: function() {
        
    }
    

});

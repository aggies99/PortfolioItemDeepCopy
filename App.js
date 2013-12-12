Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        MyApp = this;
        
        MyApp.globalContext = this.getContext().getDataContext();
        
        MyApp.epicList = [];
        MyApp.defaultEpic = MyApp.selectedEpic = "All Epics";
        MyApp.epicList.push( MyApp.selectedEpic );
        MyApp.mmfList = [];
        MyApp.defaultMMF = MyApp.selectedMMF = "All MMFs";
        MyApp.mmfList.push( MyApp.selectedMMF );
        MyApp.featureList = [];
        MyApp.defaultFeature = MyApp.selectedFeature = "All Features";
        MyApp.featureList.push( MyApp.selectedFeature );
        MyApp.userStoriesList = [];

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
        
        MyApp.epicCombo.setValue(MyApp.epicList[0]);
        //MyApp.epicCombo.setValue(MyApp.epicList[1]); //TESTING ONLY
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
                    
                    //Ext.getBody().mask("Loading...");
                    MyApp._loadPortfolioFeatures();
                }
            }
        });

        MyApp.programPane.add(MyApp.mmfCombo);

        MyApp.mmfCombo.setValue(MyApp.mmfList[0]);
        //MyApp.mmfCombo.setValue(MyApp.mmfList[1]);//TESTING ONLY
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
        //MyApp.featureCombo.setValue(MyApp.featureList[1]);// TESTING ONLY
        
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
        
        MyApp._determineWhatToCopy();
        
        MyApp.copyButton = Ext.create('Ext.Container', {
            items: [{
                xtype: 'rallybutton',
                text: 'Copy ' + MyApp.CopyId,
                handler: MyApp._copyButtonHandler
            }]
        });
        
        if ( MyApp.CopyId != "Nothing" ) {
            MyApp.programPane.add(MyApp.copyButton);
        }
    },
    
    _copyButtonHandler: function() {
        MyApp.featuresToCopy = [];
        
        if ( MyApp.defaultFeature !== MyApp.selectedFeature ) {
            MyApp.featuresToCopy = [ MyApp.selectedFeature ];
        }
        else {
            for (index=1; index<MyApp.featureList.length; index++) {
                MyApp.featuresToCopy[index-1] = MyApp.featureList[index].split(":")[0];
            }
        }

        // For each feature, start to copy all the user story children
        for (index=0; index<MyApp.featuresToCopy.length; index++) {
            MyApp.userStoriesList.length = 0;
            MyApp._feastureCopyChildrenUserStories( MyApp.featuresToCopy[index] );
        }
    },
    
    _feastureCopyChildrenUserStories: function ( featureID ) {
        thisStore = Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,

            model: "UserStory",
            
            context: MyApp.globalContext,
            fetch: ["FormattedID", "Parent", "Feature"],
            filters: [
                {
                    property: 'Feature.FormattedID',
                    operator: '=',
                    value: featureID
                },
                {
                    property: 'Parent',
                    operator: '=',
                    value: null
                }
            ],
            
            listeners: {
                load: function( myStore, records ) {
                    var index=0;
                    for (index=0; index<records.length; index++) {
                        MyApp.userStoriesList.push( records[index].data.FormattedID );
                    }
                    
                    DeepCopyUserStories( MyApp.userStoriesList );
                }
            }
        });
    }
});
